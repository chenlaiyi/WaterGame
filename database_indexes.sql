-- 点点够净水消消乐数据库索引文件

-- 用户表索引
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_total_score ON users(totalScore DESC);
CREATE INDEX idx_users_level ON users(level DESC);
CREATE INDEX idx_users_coins ON users(coins DESC);
CREATE INDEX idx_users_last_login ON users(lastLoginTime DESC);

-- 游戏记录表索引
CREATE INDEX idx_game_records_user_id ON game_records(userId);
CREATE INDEX idx_game_records_score ON game_records(score DESC);
CREATE INDEX idx_game_records_create_time ON game_records(createTime DESC);

-- 成就表索引
CREATE INDEX idx_achievements_user_id ON achievements(userId);
CREATE INDEX idx_achievements_type ON achievements(type);
CREATE INDEX idx_achievements_create_time ON achievements(createTime DESC);

-- 产品表索引
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sales ON products(sales DESC);

-- 订单表索引
CREATE INDEX idx_orders_user_id ON orders(userId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_create_time ON orders(createTime DESC);

-- 排行榜表索引
CREATE INDEX idx_rankings_type ON rankings(type);
CREATE INDEX idx_rankings_score ON rankings(score DESC);
CREATE INDEX idx_rankings_update_time ON rankings(updateTime DESC);

-- 优惠券表索引
CREATE INDEX idx_coupons_type ON coupons(type);
CREATE INDEX idx_coupons_validity ON coupons(validity DESC);
CREATE INDEX idx_coupons_create_time ON coupons(createTime DESC);

-- 用户优惠券关联表索引
CREATE INDEX idx_user_coupons_user_id ON user_coupons(userId);
CREATE INDEX idx_user_coupons_coupon_id ON user_coupons(couponId);
CREATE INDEX idx_user_coupons_status ON user_coupons(status);