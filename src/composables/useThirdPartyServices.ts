export function useThirdPartyServices() {
  const isThirdPartyServicesModalVisible = ref(false);

  function handleThirdPartyModalToggle(value: boolean) {
    isThirdPartyServicesModalVisible.value = value;
  }

  return { handleThirdPartyModalToggle, isThirdPartyServicesModalVisible };
}
