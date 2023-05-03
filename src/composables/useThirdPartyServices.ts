const isThirdPartyServicesModalVisible = ref(false);

export function useThirdPartyServices() {
  function handleThirdPartyModalToggle(value: boolean) {
    isThirdPartyServicesModalVisible.value = value;
  }

  return { handleThirdPartyModalToggle, isThirdPartyServicesModalVisible };
}
