/*
This file is part of uvcc -- USB Video Class (UVC) device configurator.
Copyright (C) 2018, 2019, 2020, 2021 Joel Purra <https://joelpurra.com/>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

import CameraHelper from "../camera-helper";
import {
	RuntimeConfigurationKeys,
	RuntimeConfigurationTypes,
} from "../runtime-configurator";

export type CommandName = string;

// NOTE HACK: magic string hack so the command manager can inject camera helper to command handlers which need it.
export const CommandHandlerArgumentCameraHelper = "cameraHelper";
export type CommandHandlerArgumentNames = RuntimeConfigurationKeys | typeof CommandHandlerArgumentCameraHelper;
export type CommandHandlerArgumentTypes = RuntimeConfigurationTypes | CameraHelper;
export type CommandHandlerLookup = Record<CommandHandlerArgumentNames, CommandHandlerArgumentTypes>;

export interface Command {
	execute: (...args: readonly unknown[]) => Promise<unknown>;
	getArguments: () => Promise<CommandHandlerArgumentNames[]>;
}

export type Commands = Record<string, Command>;
