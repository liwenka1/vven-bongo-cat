import type { CatMode } from "@/stores/cat";
import { range } from "es-toolkit";

import { hideWindow, showWindow } from "@/plugins/window";
import { useCatStore } from "@/stores/cat";
import { isMac } from "@/utils/platform";

interface ModeOption {
  label: string;
  value: CatMode;
}

// Electron 菜单项接口
interface ElectronMenuItem {
  label?: string;
  type?: "normal" | "separator" | "submenu" | "checkbox" | "radio";
  accelerator?: string;
  checked?: boolean;
  enabled?: boolean;
  click?: () => void;
  submenu?: ElectronMenuItem[];
}

export function useSharedMenu() {
  const catStore = useCatStore();
  const modeOptions: ModeOption[] = [
    { label: "标准模式", value: "standard" },
    { label: "键盘模式", value: "keyboard" }
  ];

  const getScaleMenuItems = async (): Promise<ElectronMenuItem[]> => {
    const options = range(50, 151, 25);
    const items: ElectronMenuItem[] = options.map((item) => ({
      label: item === 100 ? "默认" : `${item}%`,
      type: "checkbox",
      checked: catStore.scale === item,
      click: () => {
        catStore.setScale(item);
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
        catStore.setOpacity(item);
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
    return [
      {
        label: "偏好设置...",
        accelerator: isMac ? "Cmd+," : "Ctrl+,",
        click: () => showWindow("preference")
      },
      {
        label: "隐藏猫咪",
        click: () => hideWindow("main")
      },
      {
        label: "显示猫咪",
        click: () => showWindow("main")
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
            catStore.setMode(item.value);
          }
        }))
      },
      {
        label: "窗口穿透",
        type: "checkbox",
        checked: catStore.penetrable,
        click: () => {
          catStore.setPenetrable(!catStore.penetrable);
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
