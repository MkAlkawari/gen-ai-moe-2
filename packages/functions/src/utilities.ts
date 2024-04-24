import {
  BedrockRuntime,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntime();

/** Runs Titan Model for the given prompt and returns its output */
export async function runModel(prompt: string) {
  // Model parameters
  const modelParams = {
    inputText: prompt,
    textGenerationConfig: {
      maxTokenCount: 4096,
      stopSequences: [],
      temperature: 0,
      topP: 0.9,
    },
  };

  // Invoke model
  const response = await client.send(
    new InvokeModelCommand({
      body: JSON.stringify(modelParams),
      contentType: 'application/json',
      accept: '*/*',
      modelId: 'amazon.titan-text-express-v1',
    }),
  );

  // Parse model output
  const output = Buffer.from(response.body).toString('utf8');
  const body = JSON.parse(output);
  const text = body.results[0].outputText;

  if (typeof text !== 'string') {
    throw new Error('Unexpected variable type');
  }

  return text;
}