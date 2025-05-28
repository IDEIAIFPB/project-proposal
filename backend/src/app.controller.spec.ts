import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockGetHello = vi.fn();

  beforeEach(() => {
    appService = {
      getHello: mockGetHello,
    } as AppService;

    appController = new AppController(appService);
    vi.clearAllMocks();
  });

  describe('getHello - (método GET na raiz)', () => {
    it('deve ser definido', () => {
      expect(appController).toBeDefined();
    });

    it('deve chamar appService.getHello e retornar seu resultado', () => {
      const mensagemEsperada = 'Olá do Serviço Mockado!';
      mockGetHello.mockReturnValue(mensagemEsperada);

      const resultado = appController.getHello();

      expect(resultado).toBe(mensagemEsperada);
    });

    it('deve retornar "Hello World!" se o appService retornar essa string', () => {
      const mensagemPadrao = 'Hello World!';
      mockGetHello.mockReturnValue(mensagemPadrao);

      const resultado = appController.getHello();

      expect(resultado).toBe(mensagemPadrao);
    });
  });
});
