package com.amalitech.communityboard.exception;
 
 import org.springframework.http.HttpStatus;
 import org.springframework.http.ResponseEntity;
 import org.springframework.web.bind.MethodArgumentNotValidException;
 import org.springframework.web.bind.annotation.ExceptionHandler;
 import org.springframework.web.bind.annotation.RestControllerAdvice;
 
 import java.util.HashMap;
 import java.util.Map;
 
 @RestControllerAdvice
 public class GlobalExceptionHandler {
 
     @ExceptionHandler(ConflictException.class)
     public ResponseEntity<Map<String, String>> handleConflict(ConflictException ex) {
         Map<String, String> error = new HashMap<>();
         error.put("error", ex.getMessage());
         return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
     }
 
     @ExceptionHandler(UnauthorizedException.class)
     public ResponseEntity<Map<String, String>> handleUnauthorized(UnauthorizedException ex) {
         Map<String, String> error = new HashMap<>();
         error.put("error", ex.getMessage());
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
     }
 
     @ExceptionHandler(ForbiddenException.class)
     public ResponseEntity<Map<String, String>> handleForbidden(ForbiddenException ex) {
         Map<String, String> error = new HashMap<>();
         error.put("error", ex.getMessage());
         return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
     }
 
     @ExceptionHandler(NotFoundException.class)
     public ResponseEntity<Map<String, String>> handleNotFound(NotFoundException ex) {
         Map<String, String> error = new HashMap<>();
         error.put("error", ex.getMessage());
         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
     }
 
     @ExceptionHandler(MethodArgumentNotValidException.class)
     public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
         Map<String, String> errors = new HashMap<>();
         ex.getBindingResult().getFieldErrors().forEach(error -> 
             errors.put(error.getField(), error.getDefaultMessage())
         );
         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
     }
 
     @ExceptionHandler(Exception.class)
     public ResponseEntity<Map<String, String>> handleGeneral(Exception ex) {
         Map<String, String> error = new HashMap<>();
         error.put("error", "An internal error occurred: " + ex.getMessage());
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
     }
 }
