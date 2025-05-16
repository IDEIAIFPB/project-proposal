package com.example.controller;

import com.example.dto.UserDto;
import com.example.exceptions.CustomException;
import com.example.service.UserService;
import com.example.validations.CreateValidationGroup;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.groups.ConvertGroup;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import java.util.Map;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {

    @Inject
    UserService userService;

    @GET
    public List<UserDto> readAll() {
        return userService.getAll();
    }

    @GET
    @Path("/{id}")
    public UserDto read(@PathParam("id") UUID id){
        return userService.get(id);
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") UUID id){
        userService.delete(id);
        return Response.noContent().build();
    }

    @POST
    public Response create(@Valid @ConvertGroup(to = CreateValidationGroup.class) UserDto userDto,
                         @Context UriInfo uriInfo) {
        UserDto savedUser = userService.post(userDto);
        URI location = uriInfo.getAbsolutePathBuilder()
                .path(savedUser.id.toString())
                .build();
        return Response.created(location).entity(savedUser).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") UUID id, Map<String, Object> updates) {
        try {
            UserDto updatedUser = userService.update(id, updates);
            return Response.ok(updatedUser).build();
        } catch (CustomException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }

}
