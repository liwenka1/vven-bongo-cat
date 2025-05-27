import type { CatMode } from "@/stores/cat";
import { range } from "es-toolkit";

import { useCatStore } from "@/stores/cat";
import { isMac } from "@/utils/platform";

interface ModeOption {
  label: string;
  value: CatMode;
}

export function useSharedMenu() {
  const catStore = useCatStore();
  const modeOptions: ModeOption[] = [
    { label: "标准模式", value: "standard" },
    { label: "键盘模式", value: "keyboard" }
  ];

  const getScaleMenuItems = async (): Promise<MenuItemTemplate[]> => {
    const options = range(50, 151, 25);
    const items: MenuItemTemplate[] = options.map((item) => ({
      label: item === 100 ? "默认" : `${item}%`,
      type: "checkbox",
      checked: catStore.scale === item,
      action: "setScale",
      data: item
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

  const getOpacityMenuItems = async (): Promise<MenuItemTemplate[]> => {
    const options = range(25, 101, 25);
    const items: MenuItemTemplate[] = options.map((item) => ({
      label: `${item}%`,
      type: "checkbox",
      checked: catStore.opacity === item,
      action: "setOpacity",
      data: item
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

  const getSharedMenu = async (): Promise<MenuItemTemplate[]> => {
    return [
      {
        label: "偏好设置...",
        accelerator: isMac ? "Cmd+," : "Ctrl+,",
        action: "showPreference"
      },
      {
        label: "隐藏猫咪",
        action: "hideMain"
      },
      {
        label: "显示猫咪",
        action: "showMain"
      },
      { type: "separator" },
      {
        label: "猫咪模式",
        type: "submenu",
        submenu: modeOptions.map((item) => ({
          label: item.label,
          type: "checkbox",
          checked: catStore.mode === item.value,
          action: "setMode",
          data: item.value
        }))
      },
      {
        label: "窗口穿透",
        type: "checkbox",
        checked: catStore.penetrable,
        action: "togglePenetrable"
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
