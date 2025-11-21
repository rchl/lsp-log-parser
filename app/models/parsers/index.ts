import SublimeParser from './sublime'
import VSCodeParser from './vscode'

export { SublimeParser, VSCodeParser }

export const parsers: [typeof SublimeParser, typeof VSCodeParser] = [SublimeParser, VSCodeParser]
