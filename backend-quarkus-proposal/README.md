# quarkus-poc

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: <https://quarkus.io/>.

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./mvnw quarkus:dev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at <http://localhost:8080/q/dev/>.

## Packaging and running the application

The application can be packaged using:

```shell script
./mvnw package
```

It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:

```shell script
./mvnw package -Dquarkus.package.jar.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar target/*-runner.jar`.

## Creating a native executable

You can create a native executable using:

```shell script
./mvnw package -Dnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:

```shell script
./mvnw package -Dnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/quarkus-poc-1.0-runner`

If you want to learn more about building native executables, please consult <https://quarkus.io/guides/maven-tooling>.

## Related Guides

- REST ([guide](https://quarkus.io/guides/rest)): A Jakarta REST implementation utilizing build time processing and Vert.x. This extension is not compatible with the quarkus-resteasy extension, or any of the extensions that depend on it.

## Provided Code

### REST

Easily start your REST Web Services

[Related guide section...](https://quarkus.io/guides/getting-started-reactive#reactive-jax-rs-resources)

# Documentação do Projeto Quarkus POC

## 1. Estrutura do Projeto

```
com.example
├── controller        # Endpoints REST
│   └── UserController
├── dto               # Objetos de Transferência de Dados
│   └── UserDto
├── entity            # Entidades JPA
│   └── User
├── exceptions        # Tratamento de exceções
│   ├── CustomException
│   ├── ExceptionResponse
│   ├── JpaValidationExceptionMapper
│   ├── RollbackExceptionMapper
│   └── ValidationExceptionMapper
├── mapper            # Mapeamento DTO-Entity
│   └── UserMapper
├── repository        # Camada de acesso a dados
│   ├── UserRepo
│   └── UserRepository
├── service           # Lógica de negócio
│   └── UserService
└── validations       # Validações customizadas
    ├── Adult
    ├── AdultValidator
    └── CreateValidationGroup

```

## 2. Tecnologias Principais no pom.xml

| **Tecnologia** | **Finalidade** |
| --- | --- |
| Quarkus 3.22.2 | Framework principal |
| Hibernate ORM | Persistência de dados |
| PostgreSQL | Banco de dados |
| MapStruct 1.5.5 | Mapeamento DTO/Entity |
| Bean Validation | Validações de entrada |
| RESTEasy | Implementação JAX-RS (Java API for RESTful Web Services) |
| Checkstyle | Padronização de código |

## 3. Como Executar o Projeto

### Pré-requisitos:

- Java 21
- Maven 3.9+
- PostgreSQL rodando na porta 5432

### Passos:

1. Clonar repositório
2. Configurar banco de dados (application.properties):

```
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=SEU_USER
quarkus.datasource.password=SUA_SENHA
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/quarkus_poc
quarkus.hibernate-orm.database.generation=update

```

1. Executar aplicação:

```bash
./mvnw quarkus:dev

```

1. Acessar endpoints:
- `GET <http://localhost:8080/users`>
- `POST <http://localhost:8080/users`>

## 4. Arquitetura

**Padrão em camadas**

1. **Controller**: Recebe requisições HTTP
2. **Service**: Contém regras de negócio
3. **Repository**: Acesso ao banco de dados
4. **DTO**: Padrão de transferência de dados
5. **Mapper**: Conversão Entity/DTO

## 5. Validações Exemplo

```java
// Validação de idade mínima
public class User {
     @Column(name = "date_of_birth", nullable = false)
    @NotNull(message = "date of birth can't be null.", groups = CreateValidationGroup.class)
    @Adult
    public LocalDate dateOfBirth;
}

```

## 6. Checkstyle (Linter)

- Configuração em `checkstyle.xml` → Documento que deve ficar na raiz do projeto
- Verificar conformidade:

```bash
mvn checkstyle:check

```

## 7. Testes

Executar todos os testes:

```bash
./mvnw test

```

## 8. Endpoints Principais

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | /users | Cria novo usuário |
| GET | /users/{id} | Busca usuário por ID |
| GET | /users | Busca todos os usuários |
| PUT | /users/{id} | Atualiza usuário |
| DELETE | /users/{id} | Remove usuário |

---
