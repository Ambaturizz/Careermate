import { interviewPlanModelResponseSchema } from '@careermate/contracts';
import { zodToJsonSchema } from 'zod-to-json-schema';

const responseSchema = zodToJsonSchema(interviewPlanModelResponseSchema, { $refStrategy: 'none' });
const response = await fetch('http://127.0.0.1:11434/v1/chat/completions', {
  method: 'POST',
  headers: { 'content-type': 'application/json', authorization: 'Bearer ollama' },
  body: JSON.stringify({
    model: 'qwen3:4b-instruct',
    temperature: 0,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'interviews_plan_v1',
        strict: true,
        schema: responseSchema,
      },
    },
    messages: [
      {
        role: 'system',
        content: 'Create an interview plan in Indonesian. Return only JSON matching the supplied schema.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          responseSchema,
          data: {
            targetRole: 'Junior Data Analyst',
            seniority: 'junior',
            focusAreas: ['SQL', 'analisis data'],
            questionCount: 3,
            language: 'id',
          },
        }),
      },
    ],
  }),
});

console.log(`STATUS=${response.status}`);
console.log(await response.text());
