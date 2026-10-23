
import os
from contextlib import asynccontextmanager

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.routing import APIRoute

load_dotenv()

AUTH_URL = os.getenv("AUTH_SERVICE_URL", "http://127.0.0.1:8001")
STUDENT_URL = os.getenv("STUDENT_SERVICE_URL", "http://127.0.0.1:8002")
COURSE_URL = os.getenv("COURSE_SERVICE_URL", "http://127.0.0.1:8003")


def unique_operation_id(route: APIRoute) -> str:
    method = next(iter(route.methods or {"GET"}))
    return f"{method.lower()}_{route.name}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.client = httpx.AsyncClient(timeout=15.0)
    yield
    await app.state.client.aclose()


app = FastAPI(
    title="Student Management API Gateway",
    version="1.0.0",
    description="Gateway for authentication, students, courses, and enrollments.",
    lifespan=lifespan,
    generate_unique_id_function=unique_operation_id,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", operation_id="gateway_health")
async def health():
    return {"service": "api-gateway", "status": "healthy"}


async def forward(request: Request, base_url: str, path: str):
    client: httpx.AsyncClient = request.app.state.client
    target_url = f"{base_url.rstrip('/')}/{path.lstrip('/')}"

    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {
            "host",
            "content-length",
            "connection",
        }
    }

    try:
        upstream = await client.request(
            method=request.method,
            url=target_url,
            params=request.query_params,
            content=await request.body(),
            headers=headers,
        )

        response_headers = {
            key: value
            for key, value in upstream.headers.items()
            if key.lower() in {
                "content-type",
                "cache-control",
                "www-authenticate",
            }
        }

        return Response(
            content=upstream.content,
            status_code=upstream.status_code,
            headers=response_headers,
        )

    except httpx.TimeoutException:
        return JSONResponse(
            status_code=504,
            content={"detail": "Backend service timed out"},
        )

    except httpx.RequestError:
        return JSONResponse(
            status_code=502,
            content={"detail": "Backend service is unavailable"},
        )


# Register each HTTP method separately so Swagger gets unique operation IDs.
def register_proxy(
    route_path: str,
    base_url: str,
    target_path: str,
    name: str,
    methods: tuple[str, ...],
    *,
    path_parameter: bool = False,
    include_in_schema: bool = True,
):
    for method in methods:
        if path_parameter:

            async def endpoint(request: Request, path: str):
                return await forward(
                    request,
                    base_url,
                    f"{target_path}/{path}",
                )

        else:

            async def endpoint(request: Request):
                return await forward(request, base_url, target_path)

        endpoint.__name__ = f"{name}_{method.lower()}"

        app.add_api_route(
            route_path,
            endpoint,
            methods=[method],
            name=f"{name}_{method.lower()}",
            operation_id=f"{method.lower()}_{name}",
            include_in_schema=include_in_schema,
        )


CRUD_METHODS = ("GET", "POST", "PUT", "PATCH", "DELETE")
READ_METHODS = ("GET",)
AUTH_METHODS = ("GET", "POST", "PUT", "PATCH", "DELETE")


# ---------------- AUTHENTICATION ----------------

# Common authentication endpoints.
# These map to /auth/register, /auth/login, and /auth/me
# on the Authentication Service.
register_proxy(
    "/auth/register", AUTH_URL, "auth/register",
    "auth_register", ("POST",)
)
register_proxy(
    "/auth/login", AUTH_URL, "auth/login",
    "auth_login", ("POST",)
)
register_proxy(
    "/auth/me", AUTH_URL, "auth/me",
    "auth_me", ("GET",)
)

# Other authentication routes remain available.
# Hidden from Swagger to avoid duplicating the explicit routes above.
register_proxy(
    "/auth/{path:path}", AUTH_URL, "auth",
    "auth_proxy", AUTH_METHODS,
    path_parameter=True,
    include_in_schema=False,
)


# ---------------- STUDENTS ----------------

register_proxy(
    "/students", STUDENT_URL, "students",
    "students_root", CRUD_METHODS
)

register_proxy(
    "/students/{path:path}", STUDENT_URL, "students",
    "students_proxy", CRUD_METHODS,
    path_parameter=True,
)


# ---------------- COURSES ----------------

register_proxy(
    "/courses", COURSE_URL, "courses",
    "courses_root", CRUD_METHODS
)

register_proxy(
    "/courses/{path:path}", COURSE_URL, "courses",
    "courses_proxy", CRUD_METHODS,
    path_parameter=True,
)


# ---------------- ENROLLMENTS ----------------

# Assumes the Course Service exposes /enrollments.
register_proxy(
    "/enrollments", COURSE_URL, "enrollments",
    "enrollments_root", CRUD_METHODS
)

register_proxy(
    "/enrollments/{path:path}", COURSE_URL, "enrollments",
    "enrollments_proxy", CRUD_METHODS,
    path_parameter=True,
)
