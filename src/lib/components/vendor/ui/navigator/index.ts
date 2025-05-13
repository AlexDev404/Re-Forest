import { Menubar as MenubarPrimitive } from 'bits-ui';

import Trigger from './menubar-trigger.svelte';
import Root from './navigator.svelte';

const Menu = MenubarPrimitive.Menu;

export {
	Menu,
	//
	Root as Menubar,
	Menu as MenubarMenu,
	Trigger as MenubarTrigger,
	Root,
	Trigger
};
