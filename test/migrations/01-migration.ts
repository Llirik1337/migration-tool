import { TEST_ENUM } from '../enums/test.enum';

export function up(): void {
  console.log(TEST_ENUM.TEST);
}

export function down(): void {
  console.log(TEST_ENUM.TEST2);
}
