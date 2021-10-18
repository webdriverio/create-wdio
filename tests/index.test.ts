import { Command } from 'commander'

import { run } from '../src'

test('run', () => {
    const op = jest.fn().mockResolvedValue({})
    run(op)

    expect(op).toBeCalledWith('foobar')
    expect(new Command().arguments).toBeCalledWith('[project]')
})
