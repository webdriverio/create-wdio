const command: any = {}
command.name = jest.fn().mockReturnValue(command)
command.version = jest.fn().mockReturnValue(command)
command.usage = jest.fn().mockReturnValue(command)
command.arguments = jest.fn().mockReturnValue(command)
command.action = jest.fn((cb) => {
    cb('someProjectName')
    return command
})
command.option = jest.fn().mockReturnValue(command)
command.allowUnknownOption = jest.fn().mockReturnValue(command)
command.on = jest.fn().mockReturnValue(command)
command.parse = jest.fn().mockReturnValue(command)
command.opts = jest.fn().mockReturnValue('foobar')

export const Command = jest.fn().mockReturnValue(command)
