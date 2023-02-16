<template>
  <BalAlert class="py-2 px-2.5 mb-5" type="tip" size="md" block title="">
    <div class="flex flex-col text-sm">
      <span>{{ $t('poolChart.fxPoolWarning') }}</span>
      <BalLink
        href="https://docs.xave.co/product-overview-1/amm#mechanism"
        external
        noStyle
      >
        <div class="flex items-center text-blue-600">
          <span>
            {{ $t('learnMore') }}
          </span>
          <BalIcon name="arrow-up-right" size="sm" />
        </div>
      </BalLink>
    </div>
  </BalAlert>
</template>
