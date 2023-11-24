import {
  toTypedRxJsonSchema,
  type RxJsonSchema,
  ExtractDocumentTypeFromTypedRxJsonSchema,
} from 'rxdb';

const alarmSchemaLiteral = {
  version: 0,
  title: 'Alarm schema',
  primaryKey: 'datetime',
  type: 'object',
  properties: {
    name: {
      description: 'The alarm name',
      type: 'string',
      default: '',
    },
    active: {
      type: 'boolean',
      default: true,
    },
    datetime: {
      type: 'string',
      maxLength: 100,
      primary: true,
    },
    duration: {
      enum: [1, 3, 5],
      default: 1,
    },
    sound: {
      type: 'string',
      default: '',
    },
    snooze: {
      type: 'object',
      default: { times: 1, interval: 5 },
      properties: {
        times: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'how many times the alarm will ring',
        },
        interval: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'how many minutes b/w 2 snoozes',
        },
      },
    },
    repeat: {
      type: 'object',
      default: { unit: 'day', value: 0 },
      properties: {
        unit: {
          enum: ['hour', 'day', 'week', 'month'],
        },
        value: {
          type: 'number',
          minimum: 0,
        },
      },
    },
  },
  required: ['datetime'],
} as const;

const typedSchema = toTypedRxJsonSchema(alarmSchemaLiteral);
export type AlarmDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof typedSchema
>;

const alarmSchema: RxJsonSchema<AlarmDocType> = alarmSchemaLiteral;

export default alarmSchema;
