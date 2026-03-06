# Deployment Checklist

Use this checklist before each deployment to ensure all requirements are met.

## Pre-Deployment (All Environments)

- [ ] All tests passing locally: `mvn clean test` (backend), `npm test` (frontend)
- [ ] Code reviewed and approved
- [ ] No console errors in development
- [ ] Database migrations tested (if applicable)
- [ ] Environment variables configured correctly
- [ ] Docker images build without errors: `docker-compose build`
- [ ] Security: No hardcoded secrets in code
- [ ] No uncommitted changes in working directory

## Staging Deployment (develop branch)

- [ ] Feature branch merged to develop
- [ ] Develop branch pulled latest from remote
- [ ] All GitHub Actions secrets configured
- [ ] Staging EC2 instance running and accessible
- [ ] Staging database credentials correct in secrets
- [ ] All team members notified about staging deployment
- [ ] Run: `git push origin develop`
- [ ] Monitor workflow in GitHub Actions
- [ ] Verify deployment successful: Check EC2 logs
- [ ] Run smoke tests on staging endpoint
- [ ] Update team on feature availability in staging

## Production Deployment (main branch)

### Pre-Production Checks
- [ ] All features tested thoroughly in staging
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Database backup exists
- [ ] Rollback plan prepared
- [ ] Monitoring/alerting configured
- [ ] Production database password strong (>16 chars, mixed)
- [ ] Production JWT secret strong and unique
- [ ] SSL/TLS certificates valid (if using HTTPS)
- [ ] DNS configured correctly
- [ ] Load testing completed (if applicable)

### Deployment Execution
- [ ] Create release notes document
- [ ] Merge develop → main: `git checkout main && git merge develop`
- [ ] Tag release: `git tag v1.0.0 && git push --tags`
- [ ] Push to main: `git push origin main`
- [ ] Monitor GitHub Actions workflow
- [ ] All tests passed in workflow
- [ ] Images pushed to registry successfully
- [ ] SSH access to production instance verified
- [ ] Deployment to EC2 completed

### Post-Deployment Verification
- [ ] EC2 instance running: `docker ps`
- [ ] Frontend accessible: Test in browser
- [ ] Backend health check passing: `curl https://api.example.com/actuator/health`
- [ ] Database connected: Check logs for errors
- [ ] All microservices started: `docker-compose logs`
- [ ] No errors in application logs
- [ ] Smoke tests passed:
  - [ ] Login works
  - [ ] Create post works
  - [ ] View posts works
  - [ ] Comments work
- [ ] Performance acceptable (response times normal)
- [ ] Error tracking active (if using service like Sentry)
- [ ] Logs being collected and monitored

### Post-Deployment Monitoring

**First Hour:**
- [ ] Monitor resource usage (CPU, memory, disk)
- [ ] Check error rates
- [ ] Monitor network traffic
- [ ] Watch for database connection issues
- [ ] Monitor user login success rate

**First Day:**
- [ ] Continue monitoring error rates
- [ ] Check for memory leaks
- [ ] Monitor data integrity
- [ ] Verify backup systems working
- [ ] Document any issues

**Ongoing:**
- [ ] Set up automated alerts for:
  - [ ] High CPU usage (>80%)
  - [ ] Low disk space (<20%)
  - [ ] Failed health checks
  - [ ] Error rate spike (>5% errors)
  - [ ] Response time degradation (>5s)

## Rollback Procedure (If Needed)

If critical issues occur:

```bash
# SSH to production
ssh -i ~/.ssh/id_communityboard ubuntu@PROD_IP

# Stop current deployment
sudo su - appuser
cd /opt/app
docker-compose -f docker-compose.production.yml down

# Revert to previous version
git checkout main~1
docker-compose -f docker-compose.production.yml up -d

# Verify rollback
docker-compose logs backend
```

- [ ] Rollback completed
- [ ] System verified working
- [ ] Team notified
- [ ] Root cause analysis started
- [ ] Post-mortem scheduled

## Emergency Contacts

- DevOps Lead: [Contact info]
- On-call Support: [Contact info]
- Database Admin: [Contact info]
- Infrastructure Issues: [Contact info]

## Documentation Updates

After deployment:
- [ ] Update DEVOPS.md if procedures changed
- [ ] Document any issues encountered
- [ ] Update runbook if needed
- [ ] Add lessons learned to team wiki
- [ ] Update deployment timeline

## Deployment Timeline Template

```
Deployment Start: [TIME]
Tests Passed: [TIME]
Images Built: [TIME]
Images Pushed: [TIME]
SSH Connected: [TIME]
Containers Started: [TIME]
Health Checks Passed: [TIME]
Smoke Tests Completed: [TIME]
Deployment Complete: [TIME]
Total Duration: [DURATION]
```

## Sign-off

- [ ] Deployment conducted by: _________________
- [ ] Verified by: _________________
- [ ] Date: _________________
- [ ] Any issues/notes: _________________
