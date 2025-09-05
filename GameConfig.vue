<template>
  <div class="game-config-container">
    <div class="page-header">
      <h2>游戏配置管理</h2>
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">
        添加配置
      </el-button>
    </div>

    <div class="filter-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="searchForm.search" placeholder="搜索配置名称或描述" clearable @keyup.enter.native="handleSearch">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.status" placeholder="配置状态" clearable @change="handleSearch">
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.type" placeholder="配置类型" clearable @change="handleSearch">
            <el-option label="字符串" value="string"></el-option>
            <el-option label="整数" value="integer"></el-option>
            <el-option label="浮点数" value="float"></el-option>
            <el-option label="布尔值" value="boolean"></el-option>
            <el-option label="JSON" value="json"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <div class="table-container">
      <el-table v-loading="loading" :data="configList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="config_key" label="配置键名" min-width="150"></el-table-column>
        <el-table-column prop="config_name" label="配置名称" min-width="150"></el-table-column>
        <el-table-column prop="config_type" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.config_type)">{{ getTypeLabel(scope.row.config_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="config_value" label="配置值" min-width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" style="color: #f56c6c" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
// 导入输入验证工具
import InputValidator from '@/utils/InputValidator.js'

export default {
  name: 'GameConfig',
  data() {
    return {
      loading: false,
      configList: [],
      searchForm: { search: '', status: '', type: '' },
      pagination: { current: 1, size: 20, total: 0 }
    }
  },
  mounted() {
    this.loadConfigs()
  },
  methods: {
    async loadConfigs() {
      this.loading = true
      try {
        const response = await this.$http.get('/api/game/v1/config')
        if (response.data.code === 200) {
          this.configList = response.data.data.data
          this.pagination.total = response.data.data.total
        }
      } catch (error) {
        this.$message.error('加载配置列表失败：' + error.message)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.loadConfigs()
    },
    resetSearch() {
      this.searchForm = { search: '', status: '', type: '' }
      this.loadConfigs()
    },
    showAddDialog() {
      this.$message.info('添加配置功能开发中...')
    },
    handleEdit(row) {
      this.$message.info('编辑配置功能开发中...')
    },
    
    // 更新状态变更处理函数以添加输入验证
    async handleStatusChange(row) {
      try {
        // 验证输入数据
        if (!InputValidator.validateInteger(row.id) || row.id <= 0) {
          this.$message.error('无效的配置ID')
          row.status = row.status === 1 ? 0 : 1
          return
        }
        
        const response = await this.$http.put(`/api/game/v1/config/${row.id}`, {
          ...row
        })
        if (response.data.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          this.$message.error('状态更新失败：' + response.data.message)
          // 恢复原来的状态
          row.status = row.status === 1 ? 0 : 1
        }
      } catch (error) {
        this.$message.error('状态更新失败：' + error.message)
        // 恢复原来的状态
        row.status = row.status === 1 ? 0 : 1
      }
    },
    
    // 更新删除处理函数以添加输入验证
    handleDelete(row) {
      // 验证输入数据
      if (!InputValidator.validateInteger(row.id) || row.id <= 0) {
        this.$message.error('无效的配置ID')
        return
      }
      
      this.$confirm('确定要删除该配置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await this.$http.delete(`/api/game/v1/config/${row.id}`)
          if (response.data.code === 200) {
            this.$message.success('删除成功')
            this.loadConfigs()
          } else {
            this.$message.error('删除失败：' + response.data.message)
          }
        } catch (error) {
          this.$message.error('删除失败：' + error.message)
        }
      }).catch(() => {
        // 用户取消删除
      })
    },
    getTypeLabel(type) {
      const typeMap = {
        'string': '字符串',
        'integer': '整数',
        'float': '浮点数',
        'boolean': '布尔值',
        'json': 'JSON'
      }
      return typeMap[type] || type
    },
    getTypeTagType(type) {
      const typeMap = {
        'string': '',
        'integer': 'success',
        'float': 'warning',
        'boolean': 'danger',
        'json': 'info'
      }
      return typeMap[type] || ''
    }
  }
}
</script>

<style scoped>
.game-config-container {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>