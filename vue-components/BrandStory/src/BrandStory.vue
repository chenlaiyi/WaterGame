<template>
  <div class="brand-story">
    <h2>{{ brandInfo.name }}品牌故事</h2>
    <p class="slogan">{{ brandInfo.slogan }}</p>
    <div class="brand-description">
      <p>{{ brandInfo.description }}</p>
    </div>
    <div class="brand-features">
      <h3>核心优势</h3>
      <ul>
        <li v-for="feature in brandInfo.features" :key="feature.title">
          <strong>{{ feature.title }}:</strong> {{ feature.description }}
        </li>
      </ul>
    </div>
    <div class="product-info">
      <h3>产品特色</h3>
      <p>{{ productInfo.modelName }} - {{ productInfo.description }}</p>
      <ul>
        <li v-for="highlight in productInfo.highlights" :key="highlight">
          {{ highlight }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BrandStory',
  data() {
    return {
      brandInfo: {
        name: '点点够',
        slogan: '让每一滴水都纯净',
        description: '专注净水领域，为您提供安全、健康、便捷的净水解决方案',
        features: [
          {
            title: 'RO反渗透技术',
            description: '有效去除水中99%以上的细菌、病毒、重金属等有害物质'
          },
          {
            title: '980元2年',
            description: '超高性价比，两年仅需980元，平均每天1.34元'
          },
          {
            title: '5G智能控制',
            description: '实时监控水质，远程控制设备，智能提醒滤芯更换'
          }
        ]
      },
      productInfo: {
        modelName: 'DDG-RO501',
        description: '五级精滤RO反渗透净水器',
        highlights: [
          'RO反渗透技术，过滤精度0.0001微米',
          '五级精滤，层层保障水质安全',
          '智能滤芯提醒，及时更换不担心',
          '静音设计，工作噪音低于40分贝',
          '节能环保，制水率高达50%以上'
        ]
      }
    }
  }
}
</script>

<style scoped>
.brand-story {
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
}

.brand-story h2 {
  color: #1296db;
  text-align: center;
  font-size: 28px;
  margin-bottom: 10px;
}

.slogan {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.brand-description {
  margin: 20px 0;
  line-height: 1.6;
  font-size: 16px;
  color: #333;
}

.brand-story h3 {
  color: #333;
  font-size: 20px;
  margin: 20px 0 10px 0;
}

.brand-features ul,
.product-info ul {
  list-style-type: none;
  padding: 0;
}

.brand-features li,
.product-info li {
  margin: 10px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  font-size: 14px;
}

.product-info p {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
}
</style>