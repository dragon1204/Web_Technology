# Troubleshooting SSH Connection

## ❌ Lỗi: Permission denied (publickey,password)

Lỗi này có nghĩa là:
1. Password có thể sai
2. Server không cho phép password authentication
3. Cần dùng SSH key thay vì password
4. User/port có thể sai

## 🔧 Các Giải Pháp

### Giải Pháp 1: Kiểm Tra Password
Đảm bảo password chính xác: `8dee5a15756d8f73d03b73fb83`

**Lưu ý:** Copy-paste password có thể có ký tự ẩn. Hãy gõ lại password thủ công.

### Giải Pháp 2: Dùng SSH Key (Khuyên dùng)

#### Bước 1: Tạo SSH Key trên máy local (nếu chưa có)
```powershell
# Kiểm tra xem đã có SSH key chưa
ls ~/.ssh/id_rsa.pub

# Nếu chưa có, tạo mới
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# Nhấn Enter để dùng default location
# Nhấn Enter để không set passphrase (hoặc set nếu muốn)
```

#### Bước 2: Copy Public Key lên Server
Có 2 cách:

**Cách A: Dùng ssh-copy-id (nếu server cho phép password một lần)**
```powershell
# Cài ssh-copy-id trên Windows (nếu chưa có)
# Hoặc dùng cách B
```

**Cách B: Copy key thủ công**
```powershell
# Xem public key
cat ~/.ssh/id_rsa.pub

# Copy toàn bộ output (bắt đầu từ ssh-rsa...)
```

Sau đó trên server (nếu có cách truy cập khác), chạy:
```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Giải Pháp 3: Kiểm Tra Port và User

```powershell
# Thử với port khác (nếu server dùng port khác)
ssh -p 2222 root@159.223.61.25

# Thử với user khác
ssh ubuntu@159.223.61.25
ssh admin@159.223.61.25
```

### Giải Pháp 4: Verbose Mode để Debug

```powershell
# Xem chi tiết lỗi
ssh -v root@159.223.61.25

# Hoặc verbose hơn
ssh -vv root@159.223.61.25
ssh -vvv root@159.223.61.25
```

### Giải Pháp 5: Dùng sshpass (Tự động nhập password)

**Trên Windows:**
```powershell
# Cài sshpass cho Windows (nếu có)
# Hoặc dùng expect script
```

**Trên Linux/Mac:**
```bash
# Cài sshpass
sudo apt-get install sshpass  # Ubuntu/Debian
brew install sshpass          # Mac

# Dùng sshpass
sshpass -p '8dee5a15756d8f73d03b73fb83' ssh root@159.223.61.25
```

### Giải Pháp 6: Kiểm Tra Server Configuration

Nếu bạn có quyền truy cập server qua cách khác (console, web panel), kiểm tra:

```bash
# Kiểm tra SSH config
sudo cat /etc/ssh/sshd_config | grep -E "PasswordAuthentication|PubkeyAuthentication|PermitRootLogin"

# Nếu PasswordAuthentication = no, cần enable:
sudo nano /etc/ssh/sshd_config
# Đổi: PasswordAuthentication yes
# Đổi: PermitRootLogin yes (nếu muốn login root)
sudo systemctl restart sshd
```

## 🔑 Tạo SSH Key và Setup (Chi Tiết)

### Trên Windows PowerShell:

```powershell
# 1. Tạo SSH key
ssh-keygen -t rsa -b 4096

# 2. Xem public key
Get-Content ~/.ssh/id_rsa.pub

# 3. Copy public key (sẽ cần paste vào server)
```

### Sau đó, nếu có cách truy cập server khác:

```bash
# Trên server, tạo authorized_keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste public key vào đây
chmod 600 ~/.ssh/authorized_keys
```

### Sau đó SSH lại:
```powershell
ssh root@159.223.61.25
# Sẽ không cần password nữa
```

## 🌐 Alternative: Dùng Web Console/Control Panel

Nếu server có:
- **DigitalOcean Droplet:** Dùng Web Console
- **AWS EC2:** Dùng EC2 Instance Connect hoặc Session Manager
- **Azure VM:** Dùng Azure Portal Console
- **VPS Provider:** Kiểm tra control panel có web console không

## 📞 Liên Hệ Support

Nếu không thể SSH được, có thể:
1. Kiểm tra firewall rules trên server
2. Kiểm tra security groups (nếu dùng cloud)
3. Liên hệ hosting provider để reset password hoặc enable SSH access

## ✅ Test Connection

Sau khi fix, test lại:
```powershell
# Test connection
ssh -v root@159.223.61.25

# Nếu thành công, sẽ thấy:
# Authenticated to 159.223.61.25
```

