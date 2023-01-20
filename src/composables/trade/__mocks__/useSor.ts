import { mock } from 'vitest-mock-extended';
import { UseSor } from '../useSor';

const useSor = vi.fn(() => mock<UseSor>());

// console.log(useSor.);

export default useSor;
