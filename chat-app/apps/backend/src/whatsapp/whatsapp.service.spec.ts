import { WhatsAppService } from "./whatsapp.service";
import { HttpService } from "@nestjs/axios";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { SendMessageDto } from "./dto/send-message.dto";
import { AxiosResponse, AxiosResponseHeaders } from "axios";
import { of, throwError } from "rxjs";
import { WebhookEntryDto } from "./dto/webhook-entry.dto";
import { FieldType } from "./dto/shared/enums/field-type.enum";
import { MessageValueDto } from "./dto/messages/message-value.dto";
import { MessageDto } from "./dto/messages/message.dto";
import { StatusDto } from "./dto/status/status.dto";

const mockHttpService = {
    post: vi.fn(),
} as unknown as HttpService;

const mockEventEmitter = {
    emit: vi.fn(),
} as unknown as EventEmitter2;

describe("WhatsAppService", () => {
    let service: WhatsAppService;

    beforeEach(() => {
        service = new WhatsAppService(mockHttpService, mockEventEmitter);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("sendMessage()", () => {
        const validDto: SendMessageDto = {
            phone_number_id: "1234567890",
            access_token: "token123",
            to: "5511999999999",
            message: "Hello!",
        };

        const mockResponse: AxiosResponse = {
            data: {
                messaging_product: "whatsapp",
                contacts: [{ input: "5511999999999", wa_id: "5511999999999" }],
                messages: [{ id: "wamid.123" }],
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {
                headers: undefined as unknown as AxiosResponseHeaders,
            }
        };

        test("should send message successfully", async () => {
            const postSpy = vi.spyOn(mockHttpService, "post");
            postSpy.mockReturnValue(of(mockResponse));

            const result = await service.sendMessage(validDto);

            expect(postSpy).toHaveBeenCalledWith(
                `https://graph.facebook.com/v22.0/${validDto.phone_number_id}/messages`,
                {
                    messaging_product: "whatsapp",
                    to: validDto.to,
                    type: "text",
                    text: { body: validDto.message },
                },
                {
                    headers: {
                        Authorization: `Bearer ${validDto.access_token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            expect(result).toEqual(mockResponse);
        });

        test("should handle HTTP errors", async () => {
            const error = new Error("API error");
            vi.spyOn(mockHttpService, "post").mockReturnValue(throwError(() => error));

            await expect(service.sendMessage(validDto)).rejects.toThrow("API error");
        });
    });

    describe("handleWebhookEntry()", () => {
        const messageEntry: WebhookEntryDto = {
            id: "entry-id",
            changes: [
                {
                    field: FieldType.MESSAGES,
                    value: {
                        messaging_product: "whatsapp",
                        metadata: {
                            display_phone_number: "123456789",
                            phone_number_id: "987654321",
                        },
                        contacts: [],
                        messages: [
                            {} as MessageDto,
                        ],
                    },
                },
            ],
        };

        const statusEntry: WebhookEntryDto = {
            id: "entry-id",
            changes: [
                {
                    field: FieldType.MESSAGES,
                    value: {
                        messaging_product: "whatsapp",
                        metadata: {
                            display_phone_number: "123456789",
                            phone_number_id: "987654321",
                        },
                        statuses: [
                            {} as StatusDto
                        ],
                    },
                },
            ],
        };

        test("should emit message.received event for messages", () => {
            const emitSpy = vi.spyOn(mockEventEmitter, "emit");

            service.handleWebhookEntry(messageEntry);

            expect(emitSpy).toHaveBeenCalledWith(
                "message.received",
                messageEntry.changes[0].value
            );
        });

        test("should emit status.updated event for statuses", () => {
            const emitSpy = vi.spyOn(mockEventEmitter, "emit");

            service.handleWebhookEntry(statusEntry);

            expect(emitSpy).toHaveBeenCalledWith(
                "status.updated",
                statusEntry.changes[0].value
            );
        });

        test("should throw BadRequestException for invalid field type", () => {
            const invalidEntry: WebhookEntryDto = {
                id: "entry-id",
                changes: [
                    {
                        field: "invalid_field" as FieldType,
                        value: {} as MessageValueDto,
                    },
                ],
            };

            expect(() => service.handleWebhookEntry(invalidEntry)).toThrow(
                BadRequestException
            );
        });

        test("should handle multiple changes in one entry", () => {
            const emitSpy = vi.spyOn(mockEventEmitter, "emit");
            const multiChangeEntry: WebhookEntryDto = {
                id: "entry-id",
                changes: [
                    {
                        field: FieldType.MESSAGES,
                        value: {
                            messaging_product: "whatsapp",
                            metadata: {
                                display_phone_number: "123456789",
                                phone_number_id: "987654321",
                            },
                            contacts: [],
                            messages: [
                                {} as MessageDto
                            ],
                        },
                    },
                    {
                        field: FieldType.MESSAGES,
                        value: {
                            messaging_product: "whatsapp",
                            metadata: {
                                display_phone_number: "987654321",
                                phone_number_id: "123456789",
                            },
                            statuses: [
                                {} as StatusDto
                            ],
                        },
                    },
                ],
            };

            service.handleWebhookEntry(multiChangeEntry);

            expect(emitSpy).toHaveBeenCalledTimes(2);
            expect(emitSpy).toHaveBeenNthCalledWith(
                1,
                "message.received",
                multiChangeEntry.changes[0].value
            );
            expect(emitSpy).toHaveBeenNthCalledWith(
                2,
                "status.updated",
                multiChangeEntry.changes[1].value
            );
        });

        test("should handle empty changes array", () => {
            const emitSpy = vi.spyOn(mockEventEmitter, "emit");
            const emptyEntry: WebhookEntryDto = {
                id: "entry-id",
                changes: [],
            };

            service.handleWebhookEntry(emptyEntry);
            expect(emitSpy).not.toHaveBeenCalled();
        });
    });
});
