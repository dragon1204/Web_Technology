-- Kiểm tra xem Order table có payment fields chưa
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Order' 
AND column_name IN ('paymentId', 'paymentStatus', 'paymentMethod', 'paymentLink', 'paymentQrCode', 'paidAt')
ORDER BY column_name;
