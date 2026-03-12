package com.amalitech.communityboard.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class LoggingAspect {
    @Around("execution(public * com.amalitech.communityboard.controller..*(..)) || " +
            "execution(public * com.amalitech.communityboard.service..*(..))")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        MethodSignature sig = (MethodSignature) joinPoint.getSignature();
        String className = sig.getDeclaringType().getSimpleName();
        String methodName = sig.getName();
        log.info("START {}.{} args={}", className, methodName, joinPoint.getArgs());
        try {
            Object result = joinPoint.proceed();
            long took = System.currentTimeMillis() - start;
            log.info("END   {}.{} took={}ms", className, methodName, took);
            return result;
        } catch (Throwable ex) {
            long took = System.currentTimeMillis() - start;
            log.error("ERROR {}.{} took={}ms ex={}: {}", className, methodName, took,
                    ex.getClass().getSimpleName(), ex.getMessage());
            throw ex;
        }
    }
}
