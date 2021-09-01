url='https://192.168.0.23:8080'

for i in {1..8}
do
  qrencode -s 6 -l H -o "qr_CI0$i.png" "$url?codigo=CI0$i"
done