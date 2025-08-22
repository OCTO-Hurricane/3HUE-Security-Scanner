
# variables.tf

variable "resource_group_name" {
  description = "The name of the resource group."
  type        = string
  default     = "3hue-security-scanner-rg"
}

variable "location" {
  description = "The Azure region where the resources will be created."
  type        = string
  default     = "East US"
}

variable "container_registry_name" {
  description = "The name of the container registry."
  type        = string
  default     = "3huesecurityscanneracr"
}

variable "container_app_environment_name" {
  description = "The name of the container app environment."
  type        = string
  default     = "3hue-security-scanner-cae"
}

variable "image_tag" {
  description = "The tag for the container images."
  type        = string
  default     = "latest"
}
