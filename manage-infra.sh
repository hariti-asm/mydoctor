#!/bin/bash

# manage-infra.sh - Simple wrapper for MyDoctor AWS Infrastructure

COMMAND=$1
TF_DIR="./terraform"

function show_usage() {
    echo "Usage: ./manage-infra.sh [up|down|connect|status]"
    echo ""
    echo "Commands:"
    echo "  up      - Create or update infrastructure (terraform apply)"
    echo "  down    - Destroy all infrastructure (terraform destroy) - SAVES MONEY"
    echo "  connect - Configure kubectl to talk to the EKS cluster"
    echo "  status  - Show the current status of the infrastructure"
}

if [ ! -d "$TF_DIR" ]; then
    echo "❌ Error: Terraform directory not found at $TF_DIR"
    exit 1
fi

case $COMMAND in
    up)
        echo "🚀 Initializing and applying Terraform configuration..."
        cd "$TF_DIR" || exit 1
        terraform init && terraform apply -auto-approve
        if [ $? -eq 0 ]; then
            echo "✅ Infrastructure is up! Running 'connect' to update your kubeconfig..."
            cd .. && ./manage-infra.sh connect
        else
            echo "❌ Error: Terraform apply failed."
            exit 1
        fi
        ;;
    down)
        echo "🛑 WARNING: This will destroy your EKS cluster and all running pods."
        echo "Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo "🗑️ Destroying infrastructure..."
            cd $TF_DIR && terraform destroy -auto-approve
            echo "✅ Infrastructure destroyed. No more AWS charges for these resources."
        else
            echo "Operation cancelled."
        fi
        ;;
    connect)
        echo "🔌 Connecting to EKS cluster..."
        cd $TF_DIR
        KUBECONTROL_CMD=$(terraform output -raw configure_kubectl 2>/dev/null)
        if [ $? -eq 0 ] && [ ! -z "$KUBECONTROL_CMD" ]; then
            eval $KUBECONTROL_CMD
            echo "✅ Kubeconfig updated."
        else
            echo "❌ Error: Could not get connection command. Is the infrastructure up?"
        fi
        ;;
    status)
        echo "📊 Infrastructure Status:"
        cd $TF_DIR && terraform output
        ;;
    *)
        show_usage
        ;;
esac
