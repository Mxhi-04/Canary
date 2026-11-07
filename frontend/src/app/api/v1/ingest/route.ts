import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_FIELDS = new Set([
  'unit_id',
  'date',
  'category',
  'count',
  'stream',
  'source',
  'is_synthetic',
]);

const PROHIBITED_PERSON_FIELDS = new Set([
  'name',
  'patient_id',
  'employee_id',
  'national_id',
  'emirates_id',
  'worker_id',
  'dob',
  'birth_date',
  'phone',
  'email',
  'address',
  'ssn',
  'notes',
  'clinical_notes',
  'diagnosis_code',
  'individual_id',
]);

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Check for row-level array or single object
    const records = Array.isArray(payload) ? payload : [payload];

    for (const record of records) {
      if (typeof record !== 'object' || record === null) {
        return NextResponse.json(
          {
            error: 'Invalid payload structure: Expected JSON object or array of objects.',
            status: 'rejected',
          },
          { status: 400 }
        );
      }

      const keys = Object.keys(record);

      // 1. Check for prohibited person-level fields
      const violatedPersonFields = keys.filter((k) =>
        PROHIBITED_PERSON_FIELDS.has(k.toLowerCase())
      );

      if (violatedPersonFields.length > 0) {
        return NextResponse.json(
          {
            error: `Aggregate Contract Rejection: Payload contains prohibited person-level identifier fields [${violatedPersonFields.join(
              ', '
            )}]. Canary strictly forbids person-level data ingestion.`,
            status: 'rejected',
            code: 'PROHIBITED_PERSON_LEVEL_FIELD',
          },
          { status: 400 }
        );
      }

      // 2. Check for unknown/disallowed fields
      const disallowedFields = keys.filter((k) => !ALLOWED_FIELDS.has(k));
      if (disallowedFields.length > 0) {
        return NextResponse.json(
          {
            error: `Aggregate Contract Rejection: Unknown schema fields detected [${disallowedFields.join(
              ', '
            )}]. Strict schema validation requires approved fields only (unit_id, date, category, count, stream, source, is_synthetic).`,
            status: 'rejected',
            code: 'DISALLOWED_FIELD_STRUCTURE',
          },
          { status: 400 }
        );
      }

      // 3. Check required canonical fields
      if (!record.unit_id || !record.date || !record.category || typeof record.count !== 'number') {
        return NextResponse.json(
          {
            error: 'Missing canonical aggregate fields. Must include: unit_id (string), date (YYYY-MM-DD), category (string), count (number).',
            status: 'rejected',
            code: 'MISSING_CANONICAL_FIELDS',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        message: 'Aggregate observation validated and accepted under Privacy Contract.',
        recordsIngested: records.length,
        status: 'accepted',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Malformed JSON payload.', status: 'rejected' },
      { status: 400 }
    );
  }
}

