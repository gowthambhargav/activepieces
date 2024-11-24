import { ApplicationEventName } from '@activepieces/ee-shared'
import { ApId, CreateProjectRoleRequestBody, ProjectRole, SeekPage, UpdateProjectRoleRequestBody } from '@activepieces/shared'
import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { eventsHooks } from '../../helper/application-events'
import { projectRoleService } from './project-role.service'
export const projectRoleController: FastifyPluginAsyncTypebox = async (app) => {

    app.get('/', ListProjectRolesRequest, async (req) => {
        return projectRoleService.list({
            platformId: req.principal.platform.id,
        })
    })

    app.post('/', CreateProjectRoleRequest, async (req, reply) => {
        const projectRole = await projectRoleService.create(req.body)

        eventsHooks.get().sendUserEventFromRequest(req, {
            action: ApplicationEventName.PROJECT_ROLE_CREATED,
            data: {
                projectRole,
            },
        })
        return reply.code(StatusCodes.CREATED).send(projectRole)
    })

    app.post('/:id', UpdateProjectRoleRequest, async (req) => {
        const projectRole = await projectRoleService.update({
            id: req.params.id,
            platformId: req.principal.platform.id,
            name: req.body.name,
            permissions: req.body.permissions,
        })
        eventsHooks.get().sendUserEventFromRequest(req, {
            action: ApplicationEventName.PROJECT_ROLE_UPDATED,
            data: {
                projectRole,
            },
        })
        return projectRole
    })

    app.delete('/:id', DeleteProjectRoleRequest, async (req) => {
        const projectRole = await projectRoleService.getOneOrThrow({
            id: req.params.id,
            platformId: req.principal.platform.id,
        })
        eventsHooks.get().sendUserEventFromRequest(req, {
            action: ApplicationEventName.PROJECT_ROLE_DELETED,
            data: {
                projectRole,
            },
        })
        return projectRoleService.delete({
            id: req.params.id,
            platformId: req.principal.platform.id,
        })
    })
}

const ListProjectRolesRequest = {
    schema: {
        response: {
            [StatusCodes.OK]: SeekPage(ProjectRole),
        },
    },
}

const CreateProjectRoleRequest = {
    schema: {
        body: CreateProjectRoleRequestBody,
        response: {
            [StatusCodes.CREATED]: ProjectRole,
        },
    },
}

const UpdateProjectRoleRequest = {
    schema: {
        body: UpdateProjectRoleRequestBody,
        params: Type.Object({
            id: ApId,
        }),
        response: {
            [StatusCodes.OK]: ProjectRole,
        },
    },
}

const DeleteProjectRoleRequest = {
    schema: {
        params: Type.Object({
            id: ApId,
        }),
        response: {
            [StatusCodes.NO_CONTENT]: Type.Null(),
        },
    },
}