package com.example.controller;

import com.example.dto.UserDto;
import com.example.service.AuthService;
import com.example.validations.CreateValidationGroup;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.groups.ConvertGroup;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.net.URI;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

    @Inject
    AuthService authService;

    @POST
    @Path("/login")
    public Response create(@Valid @ConvertGroup(to = CreateValidationGroup.class) UserDto userDto,
                         @Context UriInfo uriInfo) {
        String token = authService.login(userDto.email, userDto.password);
        URI location = uriInfo.getAbsolutePathBuilder()
                .build();
        return Response.created(location).entity(token).build();
    }
}
