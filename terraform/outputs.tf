
# outputs.tf

output "api_url" {
  description = "The URL of the API container app."
  value       = azurerm_container_app.api.latest_revision_fqdn
}

output "ui_url" {
  description = "The URL of the UI container app."
  value       = azurerm_container_app.ui.latest_revision_fqdn
}
