<?php

namespace App\Http\Controllers\Game\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;

class GameConfigController extends Controller
{
    /**
     * 获取游戏配置列表
     * GET /api/game/v1/config
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('game_configs');
            
            // 搜索功能
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('config_key', 'like', "%{$search}%")
                      ->orWhere('config_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
            
            // 状态筛选
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }
            
            // 类型筛选
            if ($request->has('type') && !empty($request->type)) {
                $query->where('config_type', $request->type);
            }
            
            // 排序
            $sortBy = $request->get('sort_by', 'id');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // 分页
            $perPage = $request->get('per_page', 15);
            $result = $query->paginate($perPage);
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取失败：' . $e->getMessage(),
                'data' => null
            ]);
        }
    }
    
    /**
     * 创建配置
     * POST /api/game/v1/config
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'config_key' => 'required|string|unique:game_configs',
                'config_name' => 'required|string',
                'config_value' => 'required',
                'config_type' => 'required|in:string,integer,float,boolean,json',
                'description' => 'nullable|string',
                'status' => 'required|in:0,1'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'code' => 400,
                    'message' => '参数验证失败',
                    'data' => $validator->errors()
                ]);
            }
            
            $configId = DB::table('game_configs')->insertGetId([
                'config_key' => $request->config_key,
                'config_name' => $request->config_name,
                'config_value' => $request->config_value,
                'config_type' => $request->config_type,
                'description' => $request->description,
                'status' => $request->status,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            return response()->json([
                'code' => 200,
                'message' => '创建成功',
                'data' => ['id' => $configId]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '创建失败：' . $e->getMessage(),
                'data' => null
            ]);
        }
    }
    
    /**
     * 更新配置
     * PUT /api/game/v1/config/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'config_key' => 'required|string|unique:game_configs,config_key,' . $id,
                'config_name' => 'required|string',
                'config_value' => 'required',
                'config_type' => 'required|in:string,integer,float,boolean,json',
                'description' => 'nullable|string',
                'status' => 'required|in:0,1'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'code' => 400,
                    'message' => '参数验证失败',
                    'data' => $validator->errors()
                ]);
            }
            
            $affected = DB::table('game_configs')
                ->where('id', $id)
                ->update([
                    'config_key' => $request->config_key,
                    'config_name' => $request->config_name,
                    'config_value' => $request->config_value,
                    'config_type' => $request->config_type,
                    'description' => $request->description,
                    'status' => $request->status,
                    'updated_at' => now()
                ]);
                
            if ($affected === 0) {
                return response()->json([
                    'code' => 404,
                    'message' => '配置不存在',
                    'data' => null
                ]);
            }
            
            return response()->json([
                'code' => 200,
                'message' => '更新成功',
                'data' => null
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '更新失败：' . $e->getMessage(),
                'data' => null
            ]);
        }
    }
    
    /**
     * 删除配置
     * DELETE /api/game/v1/config/{id}
     */
    public function destroy($id)
    {
        try {
            $affected = DB::table('game_configs')->where('id', $id)->delete();
            
            if ($affected === 0) {
                return response()->json([
                    'code' => 404,
                    'message' => '配置不存在',
                    'data' => null
                ]);
            }
            
            return response()->json([
                'code' => 200,
                'message' => '删除成功',
                'data' => null
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '删除失败：' . $e->getMessage(),
                'data' => null
            ]);
        }
    }
}