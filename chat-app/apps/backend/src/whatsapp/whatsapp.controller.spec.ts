import { ForbiddenException } from "@nestjs/common";
import { WhatsAppController } from "./whatsapp.controller";
import { WhatsAppService } from "./whatsapp.service";
import { vi } from "vitest";
import { WebhookNotificationDto } from "./dto/webhook-notification.dto";
import { FieldType } from "./dto/shared/enums/field-type.enum";

const mockWhatsAppService = {
    handleWebhookEntry: vi.fn()
} as unknown as WhatsAppService;

describe("WhatsAppController", () => {
    let controller: WhatsAppController;

    beforeEach(() => {
        process.env.WHATSAPP_VERIFY_TOKEN = "valid_token";

        controller = new WhatsAppController(mockWhatsAppService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("verifyWebhook()", () => {
        test("should return challenge when token is valid", () => {
            const challenge = "test_challenge";
            const result = controller.verifyWebhook(
                "subscribe",
                "valid_token",
                challenge
            );

            expect(result).toBe(challenge);
        });

        test("should throw ForbiddenException when token is invalid", () => {
            expect(() =>
                controller.verifyWebhook(
                    "subscribe",
                    "invalid_token",
                    "challenge"
                )
            ).toThrow(ForbiddenException);
        });

        test("should throw ForbiddenException when mode is not subscribe", () => {
            expect(() =>
                controller.verifyWebhook(
                    "unsubscribe",
                    "valid_token",
                    "challenge"
                )
            ).toThrow(ForbiddenException);
        });

        test("should throw ForbiddenException when token is missing", () => {
            expect(() =>
                controller.verifyWebhook(
                    "subscribe",
                    undefined as unknown as string,
                    "challenge"
                )
            ).toThrow(ForbiddenException);
        });
    });

    describe("handleWebhook()", () => {
        const mockBody: WebhookNotificationDto = {
            object: "whatsapp_business_account",
            entry: [
                {
                    id: "123",
                    changes: [
                        {
                            value: {
                                messaging_product: "whatsapp",
                                metadata: {
                                    display_phone_number: "123456789",
                                    phone_number_id: "987654321"
                                },
                                contacts: [],
                                messages: [],
                            },
                            field: FieldType.MESSAGES
                        }
                    ]
                },
                {
                    id: "456",
                    changes: [
                        {
                            value: {
                                messaging_product: "whatsapp",
                                metadata: {
                                    display_phone_number: "987654321",
                                    phone_number_id: "123456789"
                                },
                                contacts: [],
                                messages: [],

                            },
                            field: FieldType.MESSAGES
                        }
                    ]
                }
            ]
        };

        test("should call handleWebhookEntry for each entry", () => {
            const handleWebhookEntrySpy = vi.spyOn(mockWhatsAppService, "handleWebhookEntry");
            const result = controller.handleWebhook(mockBody);

            expect(handleWebhookEntrySpy).toHaveBeenCalledTimes(2);
            expect(handleWebhookEntrySpy).toHaveBeenCalledWith(mockBody.entry[0]);
            expect(handleWebhookEntrySpy).toHaveBeenCalledWith(mockBody.entry[1]);

            expect(result).toEqual({ received: true });
        });

        test("should handle empty entry array", () => {
            const handleWebhookEntrySpy = vi.spyOn(mockWhatsAppService, "handleWebhookEntry");
            const emptyBody: WebhookNotificationDto = {
                object: "whatsapp_business_account",
                entry: []
            };

            const result = controller.handleWebhook(emptyBody);

            expect(handleWebhookEntrySpy).not.toHaveBeenCalled();
            expect(result).toEqual({ received: true });
        });

        test("should handle single entry", () => {
            const handleWebhookEntrySpy = vi.spyOn(mockWhatsAppService, "handleWebhookEntry");
            const singleEntryBody: WebhookNotificationDto = {
                object: "whatsapp_business_account",
                entry: [mockBody.entry[0]]
            };

            const result = controller.handleWebhook(singleEntryBody);

            expect(handleWebhookEntrySpy).toHaveBeenCalledTimes(1);
            expect(handleWebhookEntrySpy).toHaveBeenCalledWith(mockBody.entry[0]);
            expect(result).toEqual({ received: true });
        });
    });
});
