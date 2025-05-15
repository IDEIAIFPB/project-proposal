import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { UsersService } from "../src/users/users.service";

describe("Auth & Users (e2e)", () => {
    let app: INestApplication;
    let accessToken: string;
    let confirmCode: string;
    let resetCode: string;
    let userId: string;


    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        const usersService = moduleFixture.get<UsersService>(UsersService);
        const originalSetConfirmCode = usersService.setConfirmCode.bind(usersService) as (id: string, code: string) => Promise<void>;
        const originalSetResetCode = usersService.setResetCode.bind(usersService) as (id: string, code: string) => Promise<void>;

        jest.spyOn(usersService, "setConfirmCode").mockImplementation(async (id, code) => {
            confirmCode = code;

            await originalSetConfirmCode(id, code);
        });

        jest.spyOn(usersService, "setResetCode").mockImplementation(async (id, code) => {
            resetCode = code;

            await originalSetResetCode(id, code);
        });
    });

    afterAll(async () => {
        await app.close();
    });

    // TESTE: signup
    it("/auth/signup (POST)", async () => {
        const res = await request(app.getHttpServer())
            .post("/auth/signup")
            .send({
                confirmPassword: "Abcd@1234",
                username: "tester",
                name: "Teste",
                email: "test@example.com",
                password: "Abcd@1234",
                document: "12345678900",
                phone: "83999999999",
                dateOfBirth: "2000-01-01"
            })
            .expect(201);

        expect(res.body).toHaveProperty("message");
    });

    // TESTE: confirm code generation
    it("/auth/confirm (POST) - gera código", async () => {
        const res = await request(app.getHttpServer())
            .post("/auth/confirm")
            .send({ email: "test@example.com" })
            .expect(200);

        expect(res.body).toHaveProperty("message");
        expect(confirmCode).toBeDefined();
    });

    // TESTE: account confirmation
    it("/auth/confirm (POST) - confirma conta", async () => {
        const res = await request(app.getHttpServer())
            .post("/auth/confirm")
            .send({ email: "test@example.com", code: confirmCode })
            .expect(200);

        expect(res.body).toHaveProperty("message");
    });

    // TESTE: login
    it("/auth/login (POST)", async () => {
        const res = await request(app.getHttpServer())
            .post("/auth/login")
            .send({
                email: "test@example.com",
                password: "Abcd@1234",
            })
            .expect(200);

        expect(res.body).toHaveProperty("access_token");
        accessToken = (res.body as { access_token: string }).access_token;
    });


    // TESTE: forgot password
    it("/auth/forgot (POST)", async () => {
        const res = await request(app.getHttpServer())
            .post("/auth/forgot")
            .send({ email: "test@example.com" })
            .expect(200);

        expect(res.body).toHaveProperty("message");
        expect(resetCode).toBeDefined();
    });

    // TESTE: reset password
    it("/auth/reset (POST)", async () => {
        await request(app.getHttpServer())
            .post("/auth/reset")
            .send({
                email: "test@example.com",
                code: resetCode,
                newPassword: "Novo@1234",
                confirmPassword: "Novo@1234",
            })
            .expect(200);
    });

    // TESTE: change-password
    it("/auth/change-password (PATCH)", async () => {
        await request(app.getHttpServer())
            .patch("/auth/change-password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                currentPassword: "Novo@1234",
                newPassword: "Novo@5678",
                confirmPassword: "Novo@5678"
            })
            .expect(200);
    });

    //  TESTE: GET /users
    it("/users (GET)", async () => {
        const res = await request(app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
        
        expect(Array.isArray(res.body)).toBe(true);
    });
    
    //  TESTE: GET /me
    it("/users/me (GET)", async () => {
        const res = await request(app.getHttpServer())
            .get("/users/me")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        userId = (res.body as { id: string }).id;
    });

    // TESTE: GET /users/:id
    it("/users/:id (GET)", async () => {
        await request(app.getHttpServer())
            .get(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);
    });

    // TESTE: PATCH /users/:id
    it("/users/:id (PATCH)", async () => {
        await request(app.getHttpServer())
            .patch(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Novo Nome" })
            .expect(200);
    });

    // TESTE: DELETE /users/:id
    it("/users/:id (DELETE)", async () => {
        await request(app.getHttpServer())
            .delete(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);
    });
});
