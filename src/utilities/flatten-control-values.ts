/*
This file is part of uvcc -- USB Video Class (UVC) device configurator.
Copyright (C) 2018, 2019, 2020, 2021, 2022 Joel Purra <https://joelpurra.com/>

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

import {
	ReadonlyDeep,
} from "type-fest";
import {
	ControlValues,
} from "uvc-control";

export default function flattenControlValues(valueObject: ReadonlyDeep<ControlValues>): number | readonly number[] {
	const values = Object.values(valueObject);
	const firstValue = values[0];

	const value = values.length === 1 && typeof firstValue === "number"
		? firstValue
		// NOTE: presumably the same order has to be used when setting values later.
		: values;

	return value;
}
