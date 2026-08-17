output "instance_public_ip" {
  description = "Public IP address of Employee Management EC2"
  value = {
    for key, instance in aws_instance.emp_instance :
    key => instance.public_ip
  }
}

