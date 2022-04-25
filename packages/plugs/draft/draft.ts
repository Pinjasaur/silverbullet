import * as clientStore from "@silverbulletmd/plugos-silverbullet-syscall/clientStore";

export async function toggleMode() {
  let currentValue = !!(await clientStore.get("enableDraftMode"));
  console.log("New draft mode", !currentValue);
  await clientStore.set("enableDraftMode", !currentValue);
}
