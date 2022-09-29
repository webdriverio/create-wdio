import { vi, test, expect } from 'vitest'
import { Command } from 'commander'

import { run } from '../src'

vi.mock('commander')

test('run', async () => {
    const op = vi.fn().mockResolvedValue({})
    await run(op)

    expect(op).toBeCalledWith('foobar')
    expect(new Command().arguments).toBeCalledWith('[project-path]')
})
