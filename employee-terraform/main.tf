# key_pair

resource "aws_key_pair" "emp_key" {
  key_name   = "employee_management"
  public_key = file("./employee_management.pub")
}

#VPC
resource "aws_default_vpc" "default" {

}

#Security group

resource "aws_security_group" "sg_emp" {
  name   = "employee_management_sg"
  vpc_id = aws_default_vpc.default.id

  #inbound

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "allow ssh"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "allow http"
  }


  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "allow https"
  }

  #outbound

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "allow all"
  }

  tags = {
    Name = "employee_sg"
  }

}


resource "aws_instance" "emp_instance" {
  for_each = toset([
    "employee-backend",
  "employee-frontend"])

  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = aws_key_pair.emp_key.key_name
  user_data     = file("./user_data/install_nginx.sh")


  tags = {
    Name = "Employee_management"
  }

  root_block_device {
    volume_size = var.volume_size
    volume_type = "gp3"
  }
}
