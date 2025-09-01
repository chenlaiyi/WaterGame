<template>
  <div class="game-analytics-container">
    <div class="page-header">
      <h2>游戏数据分析</h2>
      <el-button type="primary" icon="el-icon-refresh" @click="refreshData">
        刷新数据
      </el-button>
    </div>

    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon">
              <i class="el-icon-user" style="color: #409EFF"></i>
            </div>
            <div class="card-info">
              <h3>{{ dashboardData.totalPlayers || 0 }}</h3>
              <p>总玩家数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon">
              <i class="el-icon-s-data" style="color: #67C23A"></i>
            </div>
            <div class="card-info">
              <h3>{{ dashboardData.totalSessions || 0 }}</h3>
              <p>总游戏次数</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="players-section">
      <div slot="header">
        <span>玩家列表</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="exportPlayers">导出</el-button>
      </div>

      <el-table v-loading="playersLoading" :data="playersList" stripe style="width: 100%" class="players-table">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="120">
          <template slot-scope="scope">
            <div class="player-info">
              <el-avatar :size="30" :src="scope.row.avatar" icon="el-icon-user-solid"></el-avatar>
              <span style="margin-left: 10px;">{{ scope.row.nickname || '未设置' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="best_score" label="最高分数" width="100" sortable></el-table-column>
        <el-table-column prop="total_games" label="游戏次数" width="100" sortable></el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewPlayerDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GameAnalytics',
  data() {
    return {
      loading: false,
      playersLoading: false,
      dashboardData: {
        totalPlayers: 0,
        totalSessions: 0,
        avgScore: 0,
        avgDuration: 0,
        dailyStats: []
      },
      playersList: []
    }
  },
  mounted() {
    this.loadDashboardData()
    this.loadPlayers()
  },
  methods: {
    async loadDashboardData() {
      this.loading = true
      try {
        const response = await this.$http.get('/api/game/v1/analytics/dashboard')
        if (response.data.code === 200) {
          this.dashboardData = response.data.data
        }
      } catch (error) {
        this.$message.error('加载数据失败：' + error.message)
      } finally {
        this.loading = false
      }
    },
    async loadPlayers() {
      this.playersLoading = true
      try {
        const response = await this.$http.get('/api/game/v1/analytics/players')
        if (response.data.code === 200) {
          this.playersList = response.data.data.data
        }
      } catch (error) {
        this.$message.error('加载玩家列表失败：' + error.message)
      } finally {
        this.playersLoading = false
      }
    },
    refreshData() {
      this.loadDashboardData()
      this.loadPlayers()
    },
    viewPlayerDetail(player) {
      this.$message.info('玩家详情功能开发中...')
    },
    exportPlayers() {
      this.$message.info('导出功能开发中...')
    }
  }
}
</script>

<style scoped>
.game-analytics-container {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.overview-cards {
  margin-bottom: 20px;
}
.overview-card .card-content {
  display: flex;
  align-items: center;
}
.card-icon {
  font-size: 40px;
  margin-right: 15px;
}
.card-info h3 {
  margin: 0 0 5px 0;
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
.card-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
.players-table .player-info {
  display: flex;
  align-items: center;
}
</style>