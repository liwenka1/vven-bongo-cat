import type { CatMode } from "@/stores/cat"; // Assuming stores will be copied

// import { CheckMenuItem, MenuItem, PredefinedMenuItem, Submenu } from '@tauri-apps/api/menu' // TAURI-SPECIFIC
import { range } from "es-toolkit";

import { hideWindow, showWindow } from "@/plugins/window"; // Assuming plugins will be copied/adapted
import { useCatStore } from "@/stores/cat";
import { isMac } from "@/utils/platform"; // Assuming utils will be copied

interface ModeOption {
  label: string;
  value: CatMode;
}

// TODO: This entire composable needs to be refactored for Electron's menu system.
// Electron menus are typically built in the main process. Renderer can send a template or request a context menu.

export function useSharedMenu() {
  const catStore = useCatStore();
  const modeOptions: ModeOption[] = [
    { label: "标准模式", value: "standard" },
    { label: "键盘模式", value: "keyboard" }
  ];

  // Placeholder for Electron menu item structure
  interface ElectronMenuItem {
    label?: string;
    type?: "normal" | "separator" | "submenu" | "checkbox" | "radio";
    accelerator?: string;
    checked?: boolean;
    enabled?: boolean;
    click?: () => void;
    submenu?: ElectronMenuItem[];
  }

  const getScaleMenuItems = async (): Promise<ElectronMenuItem[]> => {
    const options = range(50, 151, 25);
    const items: ElectronMenuItem[] = options.map((item) => ({
      label: item === 100 ? "默认" : `${item}%`,
      type: "checkbox",
      checked: catStore.scale === item,
      click: () => {
        catStore.scale = item;
      }
    }));

    if (!options.includes(catStore.scale)) {
      items.unshift({
        label: `${catStore.scale}%`,
        type: "checkbox",
        checked: true,
        enabled: false
      });
    }
    return items;
  };

  const getOpacityMenuItems = async (): Promise<ElectronMenuItem[]> => {
    const options = range(25, 101, 25);
    const items: ElectronMenuItem[] = options.map((item) => ({
      label: `${item}%`,
      type: "checkbox",
      checked: catStore.opacity === item,
      click: () => {
        catStore.opacity = item;
      }
    }));

    if (!options.includes(catStore.opacity)) {
      items.unshift({
        label: `${catStore.opacity}%`,
        type: "checkbox",
        checked: true,
        enabled: false
      });
    }
    return items;
  };

  const getSharedMenu = async (): Promise<ElectronMenuItem[]> => {
    // This structure needs to be sent to the main process to build the actual menu
    console.warn("TODO: getSharedMenu needs to be adapted to send menu structure to Electron main process");
    return [
      {
        label: "偏好设置...",
        accelerator: isMac ? "Cmd+," : "Ctrl+,", // Adjusted for Electron
        click: () => showWindow("preference") // This function itself needs Electron adaptation
      },
      {
        label: catStore.visible ? "隐藏猫咪" : "显示猫咪",
        click: () => {
          if (catStore.visible) {
            hideWindow("main"); // This function needs Electron adaptation
          } else {
            showWindow("main"); // This function needs Electron adaptation
          }
          catStore.visible = !catStore.visible;
        }
      },
      { type: "separator" },
      {
        label: "猫咪模式",
        type: "submenu",
        submenu: modeOptions.map((item) => ({
          label: item.label,
          type: "checkbox",
          checked: catStore.mode === item.value,
          click: () => {
            catStore.mode = item.value;
          }
        }))
      },
      {
        label: "窗口穿透",
        type: "checkbox",
        checked: catStore.penetrable,
        click: () => {
          catStore.penetrable = !catStore.penetrable;
        }
      },
      {
        label: "窗口尺寸",
        type: "submenu",
        submenu: await getScaleMenuItems()
      },
      {
        label: "不透明度",
        type: "submenu",
        submenu: await getOpacityMenuItems()
      }
    ];
  };

  return {
    getSharedMenu
  };
}
