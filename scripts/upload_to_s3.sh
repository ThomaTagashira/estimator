#upload_to_s3.sh

# Define variables
BUCKET_NAME="construction-estimator-deployment-bucket"
PACKAGE_NAME="construction-estimator-deploy-package.zip"

# Create a deployment package
zip -r $PACKAGE_NAME . -x ".*" -x "*/.*"

# Upload the package to S3
aws s3 cp $PACKAGE_NAME s3://$BUCKET_NAME/$PACKAGE_NAME

echo "Deployment package uploaded to S3://$BUCKET_NAME/$PACKAGE_NAME"