package com.eHealth.eHealth.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class ControllerLoggingInterceptor implements HandlerInterceptor {

    // Initialize the logger for this specific class
    private static final Logger logger = LoggerFactory.getLogger(ControllerLoggingInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        
        // We only want to log if the request is actually mapped to a Controller method
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            String controllerName = handlerMethod.getBeanType().getSimpleName();
            String methodName = handlerMethod.getMethod().getName();

            // Log the details (this will be routed to your .txt file in Step 3)
            logger.info("Request Method: {} | URL: {} | Controller: {} | Method: {}", 
                    request.getMethod(), request.getRequestURI(), controllerName, methodName);
        }
        return true; 
    }
}