<template>
  <div class="payment-methods-chart">
    <div class="chart-placeholder">
      <q-icon name="payment" size="48px" color="lime" />
      <div class="chart-text">Payment Methods Chart</div>
      <div class="chart-subtext">Chart.js integration needed</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.payment-methods-chart {
  width: 100%;
  height: 100%;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.chart-text {
  color: #ffffff;
  font-size: 1.1rem;
  margin: 16px 0 8px 0;
}

.chart-subtext {
  color: #cfcfcf;
  font-size: 0.875rem;
}
</style>
