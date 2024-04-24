import Joi from "joi";

export const createEventSchema = Joi.object({
    project_id: Joi.string().required().messages({
        "string.empty": "A Project has to be selected"
    }),
    event_name: Joi.string().required().messages({
        "string.empty": "Event Name cannot be empty"
    }),
    event_date: Joi.string().required().messages({
        "string.empty": "Event Date cannot be empty"
    }),
    event_start_time: Joi.string().required().messages({
        "string.empty": "Event Start Time cannot be empty"
    }),
    event_end_time: Joi.string().required().messages({
        "string.empty": "Event End Time cannot be empty"
    })
})


export const createProjectSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Project Name cannot be empty"
    }),
    active: Joi.boolean().required().messages({
        "boolean.empty": "Project Active Status cannot be empty"
    }),
    type: Joi.string().required().messages({
        "string.empty": "Project Type cannot be empty"
    }),
    description: Joi.string().required().messages({
        "string.empty": "Project Description cannot be empty"
    }),
    ous: Joi.array().min(1).required().messages({
        "array.min": "Project must be assigned to at least one Organisational Unit"
    })
})