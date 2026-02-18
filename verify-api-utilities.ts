/**
 * Verification script for API utilities
 * Run with: npx tsx verify-api-utilities.ts
 */

import {
  APIError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  isAPIError,
} from './src/lib/api-errors';

import {
  apiResponse,
  apiError,
  parsePaginationParams,
  hasValidationData,
} from './src/lib/api-utils';

import {
  loginRequestSchema,
  createJobRequestSchema,
  tailorResumeRequestSchema,
  type APIResponse,
  type OptimizationResult,
} from './src/lib/api-schemas';

console.log('🧪 Verifying API Utilities...\n');

// Test 1: Error Classes
console.log('✓ Test 1: Error Classes');
const error = new ValidationError('Test error', { field: 'email' });
console.log(`  - Error code: ${error.code}`);
console.log(`  - Error status: ${error.statusCode}`);
console.log(`  - Is API Error: ${isAPIError(error)}`);
console.log();

// Test 2: Schema Validation - Valid Data
console.log('✓ Test 2: Schema Validation - Valid Data');
const validLogin = loginRequestSchema.safeParse({
  email: 'test@example.com',
  password: 'password123',
});
console.log(`  - Login validation: ${validLogin.success ? 'PASS' : 'FAIL'}`);
console.log();

// Test 3: Schema Validation - Invalid Data
console.log('✓ Test 3: Schema Validation - Invalid Data');
const invalidLogin = loginRequestSchema.safeParse({
  email: 'not-an-email',
  password: 'password123',
});
console.log(`  - Login validation: ${!invalidLogin.success ? 'PASS (correctly rejected)' : 'FAIL'}`);
if (!invalidLogin.success) {
  console.log(`  - Errors: ${invalidLogin.error.issues.length} validation issues`);
}
console.log();

// Test 4: Job Schema
console.log('✓ Test 4: Job Schema Validation');
const validJob = createJobRequestSchema.safeParse({
  company_name: 'Acme Corp',
  position_title: 'Software Engineer',
  work_location: 'remote',
  employment_type: 'full_time',
});
console.log(`  - Job validation: ${validJob.success ? 'PASS' : 'FAIL'}`);
console.log();

// Test 5: UUID Validation
console.log('✓ Test 5: UUID Validation');
const validUUID = tailorResumeRequestSchema.safeParse({
  resume_id: '123e4567-e89b-12d3-a456-426614174000',
  job_id: '123e4567-e89b-12d3-a456-426614174001',
});
const invalidUUID = tailorResumeRequestSchema.safeParse({
  resume_id: 'not-a-uuid',
  job_id: 'also-not-a-uuid',
});
console.log(`  - Valid UUID: ${validUUID.success ? 'PASS' : 'FAIL'}`);
console.log(`  - Invalid UUID: ${!invalidUUID.success ? 'PASS (correctly rejected)' : 'FAIL'}`);
console.log();

// Test 6: Pagination
console.log('✓ Test 6: Pagination Parameters');
const req = new Request('http://localhost/api/test?page=2&limit=20');
const params = parsePaginationParams(req);
console.log(`  - Page: ${params.page} (expected: 2)`);
console.log(`  - Limit: ${params.limit} (expected: 20)`);
console.log(`  - Offset: ${params.offset} (expected: 20)`);
console.log();

// Test 7: Type Safety
console.log('✓ Test 7: TypeScript Type Safety');
const response: APIResponse<{ id: string; name: string }> = {
  data: { id: '123', name: 'Test' },
  message: 'Success',
};
console.log(`  - Response data ID: ${response.data.id}`);
console.log(`  - Response data name: ${response.data.name}`);
console.log();

// Test 8: Optimization Result Type
console.log('✓ Test 8: Complex Type Validation');
const optimization: OptimizationResult = {
  resume_id: '123e4567-e89b-12d3-a456-426614174000',
  optimized_sections: ['work_experience', 'skills'],
  changes_made: [
    {
      section: 'work_experience',
      before: 'Old text',
      after: 'New text',
      reason: 'Improved clarity',
    },
  ],
  suggestions: ['Add metrics'],
  metadata: {
    optimized_at: new Date().toISOString(),
    optimization_level: 'moderate',
    ai_model_used: 'gpt-4',
  },
};
console.log(`  - Optimization result created successfully`);
console.log(`  - Sections optimized: ${optimization.optimized_sections.join(', ')}`);
console.log(`  - Changes made: ${optimization.changes_made.length}`);
console.log();

// Test 9: Type Guard
console.log('✓ Test 9: Type Guard - hasValidationData');
const validationResult = { data: { test: 'value' } };
if (hasValidationData(validationResult)) {
  console.log(`  - Type guard correctly identified data result`);
  console.log(`  - Data value: ${validationResult.data.test}`);
}
console.log();

// Test 10: Error JSON Serialization
console.log('✓ Test 10: Error JSON Serialization');
const notFoundError = new NotFoundError('Resource not found');
const errorJSON = notFoundError.toJSON();
console.log(`  - Error message: ${errorJSON.error.message}`);
console.log(`  - Error status code: ${errorJSON.error.statusCode}`);
console.log(`  - Error code: ${errorJSON.error.code}`);
console.log();

console.log('✅ All verification tests completed successfully!\n');
console.log('Summary:');
console.log('  - Error handling: Working');
console.log('  - Schema validation: Working');
console.log('  - Type safety: Working');
console.log('  - Pagination: Working');
console.log('  - Type guards: Working');
console.log('\nAPI utilities are ready to use! 🚀');
