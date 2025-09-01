<template>
  <div class="game-activity-container">
    <div class="page-header">
      <h2>游戏活动管理</h2>
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">
        创建活动
      </el-button>
    </div>

    <div class="filter-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="searchForm.search" placeholder="搜索活动名称或描述" clearable @keyup.enter.native="handleSearch">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.status" placeholder="活动状态" clearable @change="handleSearch">
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.type" placeholder="活动类型" clearable @change="handleSearch">
            <el-option label="每日挑战" value="daily_challenge"></el-option>
            <el-option label="周锦标赛" value="weekly_tournament"></el-option>
            <el-option label="季节活动" value="seasonal_event"></el-option>
            <el-option label="分数挑战" value="score_challenge"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <div class="table-container">
      <el-table v-loading="loading" :data="activityList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="活动名称" min-width="150">
          <template slot-scope="scope">
            <div class="activity-name">
              <span>{{ scope.row.name }}</span>
              <el-tag v-if="isActivityActive(scope.row)" size="mini" type="success">进行中</el-tag>
              <el-tag v-else-if="isActivityUpcoming(scope.row)" size="mini" type="warning">即将开始</el-tag>
              <el-tag v-else size="mini" type="info">已结束</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="活动类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">{{ getTypeLabel(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="viewParticipants(scope.row)">参与者</el-button>
            <el-button type="text" size="small" @click="viewStatistics(scope.row)">统计</el-button>
            <el-button type="text" size="small" style="color: #f56c6c" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameActivity',
  data() {
    return {
      loading: false,
      activityList: [],
      searchForm: { search: '', status: '', type: '' },
      pagination: { current: 1, size: 20, total: 0 }
    }
  },
  mounted() {
    this.loadActivities()
  },
  methods: {
    async loadActivities() {
      this.loading = true
      try {
        const response = await this.$http.get('/api/game/v1/activity')
        if (response.data.code === 200) {
          this.activityList = response.data.data.data
          this.pagination.total = response.data.data.total
        }
      } catch (error) {
        this.$message.error('加载活动列表失败：' + error.message)
      } finally {
        this.loading = false
      }
    },
    isActivityActive(activity) {
      const now = new Date()
      const start = new Date(activity.start_time)
      const end = new Date(activity.end_time)
      return now >= start && now <= end && activity.status === 1
    },
    isActivityUpcoming(activity) {
      const now = new Date()
      const start = new Date(activity.start_time)
      return now < start && activity.status === 1
    },
    getTypeLabel(type) {
      const typeMap = {
        'daily_challenge': '每日挑战',
        'weekly_tournament': '周锦标赛',
        'seasonal_event': '季节活动',
        'score_challenge': '分数挑战'
      }
      return typeMap[type] || type
    },
    getTypeTagType(type) {
      const typeMap = {
        'daily_challenge': '',
        'weekly_tournament': 'success',
        'seasonal_event': 'warning',
        'score_challenge': 'danger'
      }
      return typeMap[type] || ''
    }
  }
}
</script>

<style scoped>
.game-activity-container {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.activity-name {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>