import { NextRequest, NextResponse } from 'next/server';
import { makeProblemRecord } from '@/lib/commons';

export function GET(request: NextRequest) {
  const statement = request.nextUrl.searchParams.get('problem')?.trim() || '';
  if (!statement) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  const record = makeProblemRecord(statement);
  const target = new URL(`/problems/${record.slug}`, request.url);
  target.searchParams.set('q', statement);
  return NextResponse.redirect(target);
}
