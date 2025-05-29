import { WhatsAppGateway } from "./whatsapp.gateway";
import { WhatsAppService } from "./whatsapp.service";

import { vi } from "vitest";
import { Server, Socket } from "socket.io";
import { WsSendMessageDto } from "./dto/send-message.dto";
import { MessageValueDto } from "./dto/messages/message-value.dto";
import { StatusValueDto } from "./dto/status/status-value.dto";
import { AxiosResponse } from "axios";
import { WhatsAppApiResponse } from "./interfaces/whatsapp-api.interface";

const mockSocket = {
    handshake: {
        query: {}
    },
    join: vi.fn(),
    disconnect: vi.fn(),
    id: "test-client-id"
} as unknown as Socket;

const mockServer = {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn()
} as unknown as Server;

const mockWhatsAppService = {
    sendMessage: vi.fn(),
} as unknown as WhatsAppService;

describe("WhatsAppGateway", () => {
    let gateway: WhatsAppGateway;

    beforeEach(() => {
        gateway = new WhatsAppGateway(mockWhatsAppService);
        gateway.server = mockServer;

        vi.spyOn(gateway["logger"], "log").mockImplementation(() => { });
        vi.spyOn(gateway["logger"], "error").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("should be defined", () => {
        expect(gateway).toBeDefined();
    });

    test("should have service injected", () => {
        expect(gateway["service"]).toBeDefined();
    });

    describe("handleConnection()", () => {
        test("should connect with valid credentials", async () => {
            const joinSpy = vi.spyOn(mockSocket, "join");
            const logSpy = vi.spyOn(gateway["logger"], "log");

            mockSocket.handshake.query = {
                phone_number_id: "123",
                access_token: "valid-token"
            };

            await gateway.handleConnection(mockSocket);

            expect(joinSpy).toHaveBeenCalledWith("user:123");
            expect(logSpy).toHaveBeenCalledWith(
                "Client connected: 123 (test-client-id)"
            );
        });


        test("should disconnect without phone_number_id", async () => {
            const disconnectSpy = vi.spyOn(mockSocket, "disconnect");
            const errorSpy = vi.spyOn(gateway["logger"], "error");

            mockSocket.handshake.query = { access_token: "valid-token" };

            await gateway.handleConnection(mockSocket);

            expect(disconnectSpy).toHaveBeenCalledWith(true);
            expect(errorSpy).toHaveBeenCalledWith(
                "Connection failed: Phone number id is required"
            );
        });

        test("should disconnect without access_token", async () => {
            const disconnectSpy = vi.spyOn(mockSocket, "disconnect");
            const errorSpy = vi.spyOn(gateway["logger"], "error");

            mockSocket.handshake.query = { phone_number_id: "123" };

            await gateway.handleConnection(mockSocket);

            expect(disconnectSpy).toHaveBeenCalledWith(true);
            expect(errorSpy).toHaveBeenCalledWith(
                "Connection failed: Access token is required"
            );
        });

        test("should handle errors when joining room", async () => {
            const disconnectSpy = vi.spyOn(mockSocket, "disconnect");
            const errorSpy = vi.spyOn(gateway["logger"], "error");

            mockSocket.handshake.query = {
                phone_number_id: "123",
                access_token: "valid-token"
            };
            mockSocket.join = vi.fn().mockRejectedValue(new Error("Test Error"));

            await gateway.handleConnection(mockSocket);

            expect(disconnectSpy).toHaveBeenCalledWith(true);
            expect(errorSpy).toHaveBeenCalledWith(
                "Connection failed: Test Error"
            );
        });
    });

    describe("handleDisconnect()", () => {
        test("should log disconnection", () => {
            const logSpy = vi.spyOn(gateway["logger"], "log");
            gateway.handleDisconnect(mockSocket);
            expect(logSpy).toHaveBeenCalledWith(
                "Client disconnected: test-client-id"
            );
        });
    });

    describe("handleSendMessage()", () => {
        const validPayload: WsSendMessageDto = {
            to: "000099999999",
            message: "Hello!"
        };

        test("should send message with valid credentials", async () => {
            mockSocket.handshake.query = {
                phone_number_id: "123",
                access_token: "valid-token"
            };

            const mockResponse = {
                status: 200,
                data: { messaging_product: "test", contacts: [], messages: [] }
            } as unknown as AxiosResponse<WhatsAppApiResponse>;

            const serviceSpy = vi.spyOn(mockWhatsAppService, "sendMessage")
                .mockResolvedValue(mockResponse);

            const result = await gateway.handleSendMessage(mockSocket, validPayload);

            expect(serviceSpy).toHaveBeenCalledWith({
                phone_number_id: "123",
                access_token: "valid-token",
                ...validPayload
            });
            expect(result).toEqual(mockResponse);
        });

        test("should disconnect if credentials are missing", async () => {
            mockSocket.handshake.query = {};

            const disconnectSpy = vi.spyOn(mockSocket, "disconnect");
            const errorSpy = vi.spyOn(gateway["logger"], "error");
            const sendMessageSpy = vi.spyOn(mockWhatsAppService, "sendMessage");

            await gateway.handleSendMessage(mockSocket, validPayload);

            expect(disconnectSpy).toHaveBeenCalledWith(true);
            expect(errorSpy).toHaveBeenCalledWith(
                "Connection failed: Phone number id is required"
            );
            expect(sendMessageSpy).not.toHaveBeenCalled();
        });
    });

    describe("Event Handlers", () => {
        const messagePayload: MessageValueDto = {
            messaging_product: "whatsapp",
            metadata: {
                phone_number_id: "123",
                display_phone_number: ""
            },
            contacts: [],
            messages: []
        };

        const statusPayload: StatusValueDto = {
            messaging_product: "whatsapp",
            metadata: {
                phone_number_id: "123",
                display_phone_number: ""
            },
            statuses: []
        };

        test("should emit new_messages to the correct room", () => {
            const toSpy = vi.spyOn(mockServer, "to");
            const emitSpy = vi.spyOn(mockServer, "emit");

            gateway.handleReceivedMessageEvent(messagePayload);

            expect(toSpy).toHaveBeenCalledWith("user:123");
            expect(emitSpy).toHaveBeenCalledWith(
                "new_messages",
                messagePayload
            );
        });

        test("should emit new_statuses to the correct room", () => {
            const toSpy = vi.spyOn(mockServer, "to");
            const emitSpy = vi.spyOn(mockServer, "emit");

            gateway.handleStatusUpdated(statusPayload);

            expect(toSpy).toHaveBeenCalledWith("user:123");
            expect(emitSpy).toHaveBeenCalledWith(
                "new_statuses",
                statusPayload
            );
        });
    });

    describe("getCredentials()", () => {
        test("should correctly extract credentials", () => {
            mockSocket.handshake.query = {
                phone_number_id: "123",
                access_token: "abc"
            };

            const credentials = gateway["getCredentials"](mockSocket);

            expect(credentials).toEqual({
                phoneNumberId: "123",
                accessToken: "abc"
            });
        });

        test("should handle array values", () => {
            mockSocket.handshake.query = {
                phone_number_id: ["123"],
                access_token: ["abc"]
            };

            const credentials = gateway["getCredentials"](mockSocket);

            expect(credentials).toEqual({
                phoneNumberId: "123",
                accessToken: "abc"
            });
        });
    });
});
